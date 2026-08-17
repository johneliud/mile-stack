import { ListingDetail } from "./ListingDetail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ListingDetail listingId={id} />;
}
