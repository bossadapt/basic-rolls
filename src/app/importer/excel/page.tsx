import { invoke } from "@tauri-apps/api/tauri";
import { useRouter } from "next/navigation";
export const Excel: React.FC = () => {
  const router = useRouter();
  return <h1>Reached the Excel Reader</h1>;
};
export default Excel;
