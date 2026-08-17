import { FreelancerProfile } from "./FreelancerProfile";

interface Props {
  params: Promise<{ address: string }>;
}

export default async function FreelancerProfilePage({ params }: Props) {
  const { address } = await params;
  return <FreelancerProfile address={address} />;
}
