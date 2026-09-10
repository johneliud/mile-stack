interface ListingSearchItem {
  title: string;
  description: string;
  skills: string[];
}

interface FreelancerSearchItem {
  name: string | null;
  bio: string | null;
  skills: string[];
}

function matchesSkills(itemSkills: string[], activeSkills: ReadonlySet<string>): boolean {
  return activeSkills.size === 0 || [...activeSkills].every((skill) => itemSkills.includes(skill));
}

export function filterListings<T extends ListingSearchItem>(
  listings: T[],
  search: string,
  activeSkills: ReadonlySet<string>,
): T[] {
  const query = search.toLowerCase().trim();
  return listings.filter((listing) => {
    const matchesSearch =
      !query ||
      listing.title.toLowerCase().includes(query) ||
      listing.description.toLowerCase().includes(query) ||
      listing.skills.some((skill) => skill.toLowerCase().includes(query));
    return matchesSearch && matchesSkills(listing.skills, activeSkills);
  });
}

export function filterFreelancers<T extends FreelancerSearchItem>(
  profiles: T[],
  search: string,
  activeSkills: ReadonlySet<string>,
): T[] {
  const query = search.toLowerCase().trim();
  return profiles.filter((profile) => {
    const matchesSearch =
      !query ||
      (profile.name ?? "").toLowerCase().includes(query) ||
      (profile.bio ?? "").toLowerCase().includes(query) ||
      profile.skills.some((skill) => skill.toLowerCase().includes(query));
    return matchesSearch && matchesSkills(profile.skills, activeSkills);
  });
}
