import { redirect } from "next/navigation";

/* The mono experience was promoted to the root route — keep old links
   working. */
export default function MonoRedirect() {
  redirect("/");
}
