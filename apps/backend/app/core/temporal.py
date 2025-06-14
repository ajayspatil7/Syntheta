from temporalio.client import Client
from temporalio.worker import Worker
from app.core.config import settings
from app.workflows.dag_workflow import DAGWorkflow
from app.activities.node_activities import execute_node

async def start_temporal_worker():
    # Create client connected to server
    client = await Client.connect(
        f"{settings.temporal_host}:{settings.temporal_port}"
    )

    # Run the worker
    worker = Worker(
        client,
        task_queue="dag-execution",
        workflows=[DAGWorkflow],
        activities=[execute_node]
    )

    await worker.run()

async def get_temporal_client():
    client = await Client.connect(
        f"{settings.temporal_host}:{settings.temporal_port}"
    )
    return client 