import CircleChart from "@/components/CircleChart";

export default function Page() {
  return (
    <>
      <CircleChart title={"Test1"} targetAmount={100} usedAmount={120} />
    </>
  );
}
