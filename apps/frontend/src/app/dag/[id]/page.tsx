import { DAGEditor } from "../../../components/dag/DAGEditor";

export default async function DAGEditorPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <DAGEditor dagId={id} />;
} 