import { useQuery } from "@tanstack/react-query";

import { pets } from "../api/elysia";

function useGetPetInfo(petId: string) {
  return useQuery({
    queryKey: ["pet", petId],
    queryFn: () =>
      pets
        .pet({ petId })
        .get()
        .then((response) => response.data),
  });
}

export function PetInfoView({ petId }: { petId: string }) {
  const { data: pet } = useGetPetInfo(petId);

  if (!pet) return <div>Loading...</div>;

  return (
    <div>
      <h1>Pet info {petId}</h1>
      <pre>{JSON.stringify(pet, null, 2)}</pre>
    </div>
  );
}
