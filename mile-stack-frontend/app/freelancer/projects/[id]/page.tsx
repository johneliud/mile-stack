import { ProjectDetail } from "./ProjectDetail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId) || projectId < 1) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Invalid project ID.</p>
      </div>
    );
  }

  return <ProjectDetail projectId={projectId} />;
}
