import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useAuth } from '@/hooks/useAuth';

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const auth = useAuth()
  return (
      <main></main>
  );
}
