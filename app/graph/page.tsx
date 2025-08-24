import CircleChart from "@/components/CircleChart";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <CircleChart title={"Test1"} targetAmount={100} usedAmount={120} />
      <Link href={"/protected"}>Protected</Link>
    </>
  );
}
