import { ProjectManage } from "./ProjectManage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectManage projectId={parseInt(id, 10)} />;
}
