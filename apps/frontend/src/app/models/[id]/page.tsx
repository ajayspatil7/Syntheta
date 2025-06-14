import { use } from "react";

export default function ModelDetail({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div>
      <h1>Model Details</h1>
      <p>Model ID: {params.id}</p>
    </div>
  );
} 