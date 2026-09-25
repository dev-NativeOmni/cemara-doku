import { onSnapshot, Query, Unsubscribe } from "firebase/firestore";

// Listens to a query and maps each document to `{ id, ...data }`.
// Pending serverTimestamp() fields are estimated so optimistic local writes
// render immediately instead of showing null dates.
export function subscribeQuery<T>(
  q: Query,
  onData: (items: T[]) => void,
  label: string
): Unsubscribe {
  return onSnapshot(
    q,
    (snapshot) => {
      onData(
        snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data({ serverTimestamps: "estimate" }) } as T)
        )
      );
    },
    (err) => console.error(`Gagal memuat ${label}:`, err)
  );
}
