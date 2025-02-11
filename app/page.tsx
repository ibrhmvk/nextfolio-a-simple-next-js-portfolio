import Image from "next/image";
import { socialLinks } from "./config";

export default function Page() {
  return (
    <section>
      <a href={socialLinks.twitter} target="_blank">
        <Image
          src="/dp.jpeg"
          alt="Profile photo"
          className="rounded-full bg-gray-100 block lg:mt-5 mt-0 lg:mb-5 mb-10 mx-auto sm:float-right sm:ml-5 sm:mb-5 grayscale hover:grayscale-0"
          unoptimized
          width={160}
          height={160}
          priority
        />
      </a>
      <h1 className="mb-8 text-2xl font-medium tracking-tight">
        A monky who wants to know
      </h1>
      <div className="prose prose-neutral dark:prose-invert">
        <p>
          Hi, I'm Ibrahim V K, a software developer at <a href="https://instalane.co" target="_blank">Instalane</a>, where we build AI‑powered solutions for clients. Alongside my work, I'm pursuing a <a href="https://study.iitm.ac.in/ds/" target="_blank">BS in Data Science & Applications</a> at IIT Madras.
        </p>
        <p>
          Think of us all as either curious "monkeys" or contemplative "monks," searching for our true purpose. Seekinmonky is where that exploration happens—through constant learning, building, and experimentation. Here, I share my insights, projects, and discoveries, with a focus on math, statistics, machine learning, and more.
        </p>
        <p>
          I truly believe AI will reshape our world in unimaginable ways. The best way to stay relevant is to be part of that transformation. So, explore my blog and projects—I hope you find something here that sparks your curiosity and helps you on your own journey of discovery.
        </p>
       
      </div>
    </section>
  );
}
