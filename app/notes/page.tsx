import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();

  const { data: notes } = await supabase.from("notes").select();

  return <pre>{JSON.stringify(notes, null, 2)}</pre>;
}

// "use client";
//
// import { Button } from "@/components/ui/button";
// import { createClient } from "@/lib/supabase/client";
// import { useEffect, useState } from "react";
//
// export default function Page() {
//   const [notes, setNotes] = useState<any[] | null>(null);
//   const supabase = createClient();
//
//   useEffect(() => {
//     const getData = async () => {
//       const { data } = await supabase.from("notes").select();
//       setNotes(data);
//     };
//     getData();
//   }, []);
//
//   return (
//     <>
//       <pre>{JSON.stringify(notes, null, 2)}</pre>
//       <Button>Click me</Button>
//     </>
//   );
// }
