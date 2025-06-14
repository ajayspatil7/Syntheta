from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Literal, Union
from collections import deque # Import deque for topological sort
from fastapi.middleware.cors import CORSMiddleware # Import CORSMiddleware
import pandas as pd # Import pandas
import os
import numpy as np # Import numpy for Gaussian distribution

app = FastAPI()

# Add CORS middleware
origins = [
    "http://localhost:3000",  # Allow requests from your frontend
    # You can add other origins here if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define Pydantic models based on frontend types/dag.ts

# Node Configurations
class ConnectionCredentials(BaseModel):
    access_key: Optional[str] = None
    secret_key: Optional[str] = None

class APIAuth(BaseModel):
    type: Optional[Literal['basic', 'bearer', 'api_key']] = None
    token: Optional[str] = None

class APIPagination(BaseModel):
    enabled: Optional[bool] = None
    type: Optional[Literal['offset', 'cursor', 'page']] = None
    param_name: Optional[str] = None

class ColumnConstraints(BaseModel):
    min: Optional[float] = None
    max: Optional[float] = None
    pattern: Optional[str] = None
    unique: Optional[bool] = None
    required: Optional[bool] = None

class ColumnSchema(BaseModel):
    name: str
    type: Literal['string', 'number', 'boolean', 'date', 'datetime', 'json', 'array']
    nullable: Optional[bool] = None
    description: Optional[str] = None
    constraints: Optional[ColumnConstraints] = None

class SourceNodeConnection(BaseModel):
    # Database connections
    host: Optional[str] = None
    port: Optional[int] = None
    database: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    ssl: Optional[bool] = None
    
    # File storage connections
    bucket: Optional[str] = None
    path: Optional[str] = None
    region: Optional[str] = None
    credentials: Optional[ConnectionCredentials] = None
    
    # API connections
    url: Optional[str] = None
    method: Optional[Literal['GET', 'POST', 'PUT', 'DELETE']] = None
    headers: Optional[Dict[str, str]] = None
    auth: Optional[APIAuth] = None
    
    # Kafka connections
    bootstrap_servers: Optional[str] = None
    topic: Optional[str] = None
    group_id: Optional[str] = None

class SourceNodeSchema(BaseModel):
    columns: List[ColumnSchema]

class SourceNodeOptions(BaseModel):
    # CSV options
    delimiter: Optional[str] = None
    encoding: Optional[str] = None
    has_header: Optional[bool] = None
    
    # Database options
    query: Optional[str] = None
    batch_size: Optional[int] = None
    
    # API options
    pagination: Optional[APIPagination] = None
    
    # Kafka options
    auto_offset_reset: Optional[Literal['earliest', 'latest']] = None
    max_poll_records: Optional[int] = None

class DataQualityRule(BaseModel):
    column: str
    rule: Literal['not_null', 'unique', 'range', 'pattern', 'custom']
    params: Optional[Dict[str, Any]] = None

class NodeValidation(BaseModel):
    required_columns: Optional[List[str]] = None
    data_quality_rules: Optional[List[DataQualityRule]] = None
    required_metrics: Optional[List[str]] = None # Used in Evaluator and Generator
    thresholds: Optional[Dict[str, float]] = None # Used in Evaluator and Generator

class SourceNodeConfig(BaseModel):
    type: Literal['csv', 'postgresql', 'mysql', 'minio', 's3', 'api', 'kafka']
    connection: SourceNodeConnection
    schema: Optional[SourceNodeSchema] = None
    options: Optional[SourceNodeOptions] = None
    validation: Optional[NodeValidation] = None

class GeneratorParameters(BaseModel):
    num_samples: int
    batch_size: Optional[int] = None
    epochs: Optional[int] = None
    learning_rate: Optional[float] = None
    embedding_dim: Optional[int] = None
    generator_dim: Optional[List[int]] = None
    discriminator_dim: Optional[List[int]] = None
    compress_dims: Optional[List[int]] = None # TVAE specific
    decompress_dims: Optional[List[int]] = None # TVAE specific
    n_clusters: Optional[int] = None # CopulaGAN specific
    custom_script: Optional[str] = None # Custom generator
    custom_requirements: Optional[List[str]] = None # Custom generator

class ConstraintParams(BaseModel):
    min: Optional[float] = None
    max: Optional[float] = None
    distribution: Optional[Literal['normal', 'uniform', 'exponential', 'custom']] = None
    mean: Optional[float] = None
    std: Optional[float] = None
    correlated_with: Optional[str] = None
    correlation_type: Optional[Literal['pearson', 'spearman', 'kendall']] = None
    correlation_value: Optional[float] = None
    custom_rule: Optional[str] = None

class Constraint(BaseModel):
    column: str
    type: Literal['range', 'distribution', 'correlation', 'custom']
    params: ConstraintParams

class PrivacyConfig(BaseModel):
    anonymization: Optional[bool] = None
    k_anonymity: Optional[int] = None
    l_diversity: Optional[int] = None
    t_closeness: Optional[int] = None

class GeneratorDataQuality(BaseModel):
     privacy: Optional[PrivacyConfig] = None
     validation: Optional[NodeValidation] = None

class OutputFormat(BaseModel):
    schema: Optional[SourceNodeSchema] = None # Reusing SourceNodeSchema for now, might need refinement

class GeneratorNodeConfig(BaseModel):
    type: Literal['ctgan', 'tvae', 'copulagan', 'gaussian', 'uniform', 'custom']
    parameters: GeneratorParameters
    constraints: Optional[List[Constraint]] = None
    data_quality: Optional[GeneratorDataQuality] = None
    output_format: Optional[OutputFormat] = None

class EvaluatorNodeConfig(BaseModel):
    metrics: Optional[List[str]] = None
    validation: Optional[NodeValidation] = None

class ExporterDestination(BaseModel):
    path: Optional[str] = None
    bucket: Optional[str] = None

class ExporterOptions(BaseModel):
    delimiter: Optional[str] = None
    encoding: Optional[str] = None

class ExporterNodeConfig(BaseModel):
    type: Literal['csv', 'json', 'minio', 's3']
    destination: ExporterDestination
    options: Optional[ExporterOptions] = None
    validation: Optional[NodeValidation] = None

# Union of all possible node configurations
NodeConfig = Union[SourceNodeConfig, GeneratorNodeConfig, EvaluatorNodeConfig, ExporterNodeConfig]

class DagNodeData(BaseModel):
    label: str
    config: Optional[NodeConfig] = None

class DagNode(BaseModel):
    id: str
    type: str # Node type (e.g., 'source', 'generator') - useful for discrimination in backend
    position: Dict[str, float]
    data: DagNodeData

class DagEdge(BaseModel):
    id: str
    source: str
    target: str

class SyntheticDataDAG(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    nodes: List[DagNode]
    edges: List[DagEdge]

@app.post("/api/v1/dags/run")
async def run_dag(dag: SyntheticDataDAG):
    print(f"Received DAG for execution: {dag.name}")
    print(f"Nodes: {len(dag.nodes)}")
    print(f"Edges: {len(dag.edges)}")

    # Build adjacency list and in-degree for topological sort
    adjacency_list: Dict[str, List[str]] = {node.id: [] for node in dag.nodes}
    in_degree: Dict[str, int] = {node.id: 0 for node in dag.nodes}

    # Map node ids to node objects for easier access
    node_map: Dict[str, DagNode] = {node.id: node for node in dag.nodes}

    for edge in dag.edges:
        if edge.source in adjacency_list and edge.target in in_degree:
            adjacency_list[edge.source].append(edge.target)
            in_degree[edge.target] += 1
        else:
            # Handle potential errors if edge connects to non-existent nodes
            print(f"Warning: Edge {edge.id} connects to non-existent node(s).")

    # Perform topological sort (Kahn's algorithm)
    queue = deque([node_id for node_id, degree in in_degree.items() if degree == 0])
    execution_order: List[str] = []

    while queue:
        current_node_id = queue.popleft()
        execution_order.append(current_node_id)

        for neighbor_id in adjacency_list.get(current_node_id, []):
            in_degree[neighbor_id] -= 1
            if in_degree[neighbor_id] == 0:
                queue.append(neighbor_id)

    # Check for cycles
    if len(execution_order) != len(dag.nodes):
        raise HTTPException(status_code=400, detail="DAG contains a cycle. Cannot execute.")

    print("Execution Order (Node IDs):")
    for node_id in execution_order:
        print(node_id)

    # --- Node Execution Logic ---
    data_store: Dict[str, Any] = {}

    for node_id in execution_order:
        node = node_map[node_id] # Retrieve the node object using the map
        print(f"Processing node: {node.id} (Type: {node.type})")

        try:
            if node.type == 'source':
                await execute_source_node(node, dag, data_store)
            elif node.type == 'generator':
                await execute_generator_node(node, dag, data_store)
            elif node.type == 'evaluator':
                await execute_evaluator_node(node, dag, data_store)
            elif node.type == 'exporter':
                await execute_exporter_node(node, dag, data_store)
            # Add other node types here as needed
            else:
                print(f"Warning: Unknown node type: {node.type}")
        except Exception as e:
            print(f"Error executing node {node.id}: {e}")
            # TODO: Implement more robust error handling and reporting
            raise HTTPException(status_code=500, detail=f"Error executing node {node.id}: {e}")

    print("DAG execution completed.")

    return {"message": "DAG execution request received", "dag_name": dag.name, "dag_id": dag.id, "execution_order": execution_order, "data_store": data_store} # Optionally return data_store for debugging

# Placeholder execution functions for each node type
async def execute_source_node(node: DagNode, dag: SyntheticDataDAG, data_store: Dict[str, Any]):
    print(f"Executing Source Node: {node.id} with config {node.data.config}")
    
    config = node.data.config
    if not isinstance(config, SourceNodeConfig):
        print(f"Error: Invalid config for Source node {node.id}")
        # In a real application, you'd raise an HTTPException or similar
        return

    source_type = config.type
    connection = config.connection
    options = config.options

    if source_type == 'csv':
        print(f"Source Type: CSV. Path: {connection.path}")
        try:
            # Check if we have file content in the config
            if hasattr(connection, 'fileContent') and connection.fileContent:
                # Create a temporary file with the content
                import tempfile
                with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv') as temp_file:
                    temp_file.write(connection.fileContent)
                    temp_path = temp_file.name
                
                # Read the CSV file
                df = pd.read_csv(
                    temp_path,
                    delimiter=options.delimiter or ',',
                    encoding=options.encoding or 'utf-8'
                )
                
                # Clean up the temporary file
                import os
                os.unlink(temp_path)
            else:
                # Try to read from the provided path
                df = pd.read_csv(
                    connection.path,
                    delimiter=options.delimiter or ',',
                    encoding=options.encoding or 'utf-8'
                )
            
            # Store the data
            data_store[node.id] = df.to_dict('records')
            return {"status": "success", "data": data_store[node.id]}
        except Exception as e:
            print(f"Error: {str(e)}")
            return {"status": "error", "message": str(e)}
    elif source_type == 'postgresql':
        print(f"Source Type: PostgreSQL. Host: {connection.host}, Database: {connection.database}")
        # TODO: Implement PostgreSQL reading logic
        pass

    # Add logic for other source types (mysql, minio, s3, api, kafka) here

    # Store output data in data_store, e.g., data_store[node.id] = read_data()

async def execute_generator_node(node: DagNode, dag: SyntheticDataDAG, data_store: Dict[str, Any]):
    print(f"Executing Generator Node: {node.id} with config {node.data.config}")
    
    config = node.data.config
    if not isinstance(config, GeneratorNodeConfig):
        print(f"Error: Invalid config for Generator node {node.id}")
        return

    # Find the input node(s) for this generator node
    input_node_ids = [edge.source for edge in dag.edges if edge.target == node.id]

    if not input_node_ids:
        print(f"Error: Generator node {node.id} has no input node.")
        data_store[node.id] = [] # Store empty data
        # TODO: Report this error to the frontend
        return
    
    # For simplicity, assume one input node for now
    input_node_id = input_node_ids[0]

    if input_node_id not in data_store:
        print(f"Error: Input data for node {input_node_id} not found in data_store.")
        data_store[node.id] = [] # Store empty data
        # TODO: Report this error to the frontend
        return
    
    input_data = data_store[input_node_id]
    print(f"Retrieved input data for node {node.id} from node {input_node_id}. Data type: {type(input_data)}")

    generator_type = config.type
    parameters = config.parameters

    generated_data = []

    if generator_type == 'gaussian':
        print(f"Generator Type: Gaussian. Parameters: {parameters}")
        if isinstance(input_data, list) and input_data:
            try:
                # Convert input data to pandas DataFrame for easier numerical operations
                df_input = pd.DataFrame(input_data)

                # Select numerical columns and calculate mean and std deviation
                numerical_cols = df_input.select_dtypes(include=['number']).columns
                if numerical_cols.empty:
                    print(f"Warning: No numerical columns found in input data for gaussian generator node {node.id}. Cannot generate data.")
                    data_store[node.id] = []
                    return

                means = df_input[numerical_cols].mean().to_dict()
                stds = df_input[numerical_cols].std().to_dict()
                
                # Handle potential NaN std deviations (e.g., single-value columns)
                stds = {col: std if not pd.isna(std) else 0.0 for col, std in stds.items()}

                num_samples = parameters.num_samples if parameters.num_samples is not None else len(df_input) # Default to number of input rows if not specified
                print(f"Generating {num_samples} samples using Gaussian distribution based on input data stats.")
                print(f"Calculated Means: {means}")
                print(f"Calculated Stds: {stds}")

                # Generate data using numpy
                generated_df = pd.DataFrame()
                for col in numerical_cols:
                    generated_df[col] = pd.Series(np.random.normal(means[col], stds[col], num_samples))
                    
                # For non-numerical columns, you might want to handle them differently
                # (e.g., sample from existing values, generate based on distributions, etc.)
                # For this basic implementation, we'll just add empty columns for non-numerical types
                for col in df_input.columns:
                    if col not in numerical_cols:
                        generated_df[col] = pd.Series([None] * num_samples) # Placeholder
                        
                # Ensure columns are in the same order as input
                generated_df = generated_df[df_input.columns] # Reorder columns

                generated_data = generated_df.to_dict(orient='records')

            except Exception as e:
                print(f"Error generating gaussian data for node {node.id}: {e}")
                data_store[node.id] = []
                # TODO: Report this error to the frontend
                return
        else:
            print(f"Warning: Input data for gaussian generator node {node.id} is not in expected list format or is empty.")
            data_store[node.id] = []
            return
            
    elif generator_type == 'uniform':
        print(f"Generator Type: Uniform. Parameters: {parameters}")
        # TODO: Implement uniform data generation logic
        pass

    # TODO: Implement other generator types (ctgan, tvae, copulagan, custom)

    # Store the generated data
    data_store[node.id] = generated_data 
    print(f"Generated data stored for node {node.id}. Samples: {len(generated_data)}")

async def execute_evaluator_node(node: DagNode, dag: SyntheticDataDAG, data_store: Dict[str, Any]):
    print(f"Executing Evaluator Node: {node.id} with config {node.data.config}")
    
    config = node.data.config
    if not isinstance(config, EvaluatorNodeConfig):
        print(f"Error: Invalid config for Evaluator node {node.id}")
        return

    # Find the input node(s) for this evaluator node
    input_node_ids = [edge.source for edge in dag.edges if edge.target == node.id]

    if not input_node_ids:
        print(f"Error: Evaluator node {node.id} has no input node.")
        data_store[node.id] = {"error": "No input node found"}
        return
    
    # For simplicity, assume one input node for now
    input_node_id = input_node_ids[0]

    if input_node_id not in data_store:
        print(f"Error: Input data for node {input_node_id} not found in data_store.")
        data_store[node.id] = {"error": "Input data not found"}
        return
    
    input_data = data_store[input_node_id]
    print(f"Retrieved input data for node {node.id} from node {input_node_id}")

    # Convert input data to pandas DataFrame for analysis
    df = pd.DataFrame(input_data)
    
    # Initialize results dictionary
    results = {
        "metrics": {},
        "validation": {},
        "data_quality": {}
    }

    # Get the list of metrics to calculate from the node configuration
    metrics_to_calculate = config.metrics if config.metrics is not None else [
        'mean', 'std', 'min', 'max', 'median', 'null_count', 'unique_count', 'most_common' # Default to all if none specified
    ]

    # Calculate selected statistical metrics for numerical columns
    numerical_cols = df.select_dtypes(include=['number']).columns
    for col in numerical_cols:
        column_metrics = {}
        if 'mean' in metrics_to_calculate:
            column_metrics["mean"] = float(df[col].mean())
        if 'std' in metrics_to_calculate:
            column_metrics["std"] = float(df[col].std())
        if 'min' in metrics_to_calculate:
            column_metrics["min"] = float(df[col].min())
        if 'max' in metrics_to_calculate:
            column_metrics["max"] = float(df[col].max())
        if 'median' in metrics_to_calculate:
            column_metrics["median"] = float(df[col].median())
        if 'null_count' in metrics_to_calculate:
            column_metrics["null_count"] = int(df[col].isnull().sum())
        if 'unique_count' in metrics_to_calculate:
            column_metrics["unique_count"] = int(df[col].nunique())
        # Add other numerical metrics here if needed
        
        if column_metrics:
            results["metrics"][col] = column_metrics

    # Calculate selected categorical metrics for non-numerical columns
    categorical_cols = df.select_dtypes(exclude=['number']).columns
    for col in categorical_cols:
        column_metrics = {}
        if 'unique_count' in metrics_to_calculate:
            column_metrics["unique_count"] = int(df[col].nunique())
        if 'null_count' in metrics_to_calculate:
            column_metrics["null_count"] = int(df[col].isnull().sum())
        if 'most_common' in metrics_to_calculate:
            column_metrics["most_common"] = df[col].value_counts().head(1).to_dict()
        # Add other categorical metrics here if needed

        if column_metrics:
            results["metrics"][col] = column_metrics

    # Perform validation checks if specified
    if config.validation:
        validation = config.validation
        
        # Check required columns
        if validation.required_columns:
            missing_columns = [col for col in validation.required_columns if col not in df.columns]
            results["validation"]["required_columns"] = {
                "status": "pass" if not missing_columns else "fail",
                "missing_columns": missing_columns
            }

        # Check data quality rules
        if validation.data_quality_rules:
            results["validation"]["data_quality_rules"] = {}
            for rule in validation.data_quality_rules:
                if rule.column not in df.columns:
                    results["validation"]["data_quality_rules"][rule.column] = {
                        "status": "fail",
                        "error": "Column not found"
                    }
                    continue

                rule_result = {"status": "pass"}
                
                if rule.rule == "not_null":
                    null_count = df[rule.column].isnull().sum()
                    rule_result["null_count"] = int(null_count)
                    rule_result["status"] = "pass" if null_count == 0 else "fail"
                
                elif rule.rule == "unique":
                    unique_count = df[rule.column].nunique()
                    total_count = len(df)
                    rule_result["unique_count"] = int(unique_count)
                    rule_result["total_count"] = int(total_count)
                    rule_result["status"] = "pass" if unique_count == total_count else "fail"
                
                elif rule.rule == "range" and rule.params:
                    min_val = rule.params.get("min")
                    max_val = rule.params.get("max")
                    if min_val is not None:
                        below_min = (df[rule.column] < min_val).sum()
                        rule_result["below_min"] = int(below_min)
                        if below_min > 0:
                            rule_result["status"] = "fail"
                    if max_val is not None:
                        above_max = (df[rule.column] > max_val).sum()
                        rule_result["above_max"] = int(above_max)
                        if above_max > 0:
                            rule_result["status"] = "fail"
                
                elif rule.rule == "pattern" and rule.params and "pattern" in rule.params:
                    pattern = rule.params["pattern"]
                    import re
                    matches = df[rule.column].astype(str).str.match(pattern)
                    invalid_count = (~matches).sum()
                    rule_result["invalid_count"] = int(invalid_count)
                    rule_result["status"] = "pass" if invalid_count == 0 else "fail"

                results["validation"]["data_quality_rules"][rule.column] = rule_result

    # Store the evaluation results
    data_store[node.id] = results
    print(f"Evaluation completed for node {node.id}")
    print(f"Results: {results}")

async def execute_exporter_node(node: DagNode, dag: SyntheticDataDAG, data_store: Dict[str, Any]):
    print(f"Executing Exporter Node: {node.id} with config {node.data.config}")
    
    config = node.data.config
    if not isinstance(config, ExporterNodeConfig):
        print(f"Error: Invalid config for Exporter node {node.id}")
        data_store[node.id] = {"error": "Invalid config"}
        return

    # Find the input node for this exporter node
    input_node_ids = [edge.source for edge in dag.edges if edge.target == node.id]

    if not input_node_ids:
        print(f"Error: Exporter node {node.id} has no input node.")
        data_store[node.id] = {"error": "No input node found"}
        # TODO: Report this error to the frontend
        return
    
    # Assuming only one input node for simplicity
    input_node_id = input_node_ids[0]

    if input_node_id not in data_store or not data_store[input_node_id]:
        print(f"Error: Input data for node {input_node_id} not found or is empty in data_store.")
        data_store[node.id] = {"error": "Input data not found or empty"}
        # TODO: Report this error to the frontend
        return
    
    input_data = data_store[input_node_id]
    print(f"Retrieved input data for node {node.id} from node {input_node_id}")

    # Ensure input data is in a format pandas can handle (list of dicts)
    if not isinstance(input_data, list) or (input_data and not isinstance(input_data[0], dict)):
         print(f"Error: Input data for node {node.id} is not in the expected list of dictionaries format.")
         data_store[node.id] = {"error": "Invalid input data format"}
         # TODO: Report this error to the frontend
         return
         
    df_to_export = pd.DataFrame(input_data)

    exporter_type = config.type
    destination = config.destination
    options = config.options
    
    export_status = "fail"
    export_message = ""
    exported_path = None

    if exporter_type == 'csv':
        print(f"Exporter Type: CSV. Destination: {destination.path}")
        if destination.path:
            try:
                # Configure writing based on options
                write_options = {}
                if options and options.delimiter:
                    write_options['sep'] = options.delimiter # pandas uses sep for delimiter
                if options and options.encoding:
                     write_options['encoding'] = options.encoding
                # Add other relevant pandas to_csv options as needed

                # Determine the full file path
                file_path = destination.path
                if not os.path.isabs(file_path):
                    # Assume relative path is relative to the engine directory
                    file_path = os.path.join(os.getcwd(), file_path)

                # Ensure the directory exists
                os.makedirs(os.path.dirname(file_path), exist_ok=True)

                df_to_export.to_csv(file_path, index=False, **write_options)
                export_status = "success"
                export_message = f"Successfully exported data to CSV: {file_path}"
                exported_path = file_path
                print(export_message)

            except Exception as e:
                export_message = f"Error exporting data to CSV {destination.path}: {e}"
                print(export_message)
                # TODO: Report this error back to the frontend
        else:
            export_message = f"Warning: CSV exporter node {node.id} has no path specified."
            print(export_message)
            # TODO: Report this error to the frontend

    elif exporter_type == 'json':
        print(f"Exporter Type: JSON. Destination: {destination.path}")
        # TODO: Implement JSON export logic
        export_message = "JSON export not yet implemented."
        print(export_message)
        pass

    elif exporter_type == 's3':
        print(f"Exporter Type: S3. Bucket: {destination.bucket}, Path: {destination.path}")
        # TODO: Implement S3 export logic
        export_message = "S3 export not yet implemented."
        print(export_message)
        pass

    # Add logic for other exporter types here

    # Store the export result in data_store
    data_store[node.id] = {
        "status": export_status,
        "message": export_message,
        "path": exported_path
    }
    print(f"Export result stored for node {node.id}")
    print(f"Results: {data_store[node.id]}") 