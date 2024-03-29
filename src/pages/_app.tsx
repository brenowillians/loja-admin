import BodyTemplate from "@/components/body-template";
import { AuthProvider } from "@/context/authContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";


export default function App({ Component, pageProps }: AppProps) {

  return( 
    <AuthProvider>
      <BodyTemplate>
        <Component {...pageProps} />
      </BodyTemplate> 
    </AuthProvider>
  )
  
}
