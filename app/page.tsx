import Image from "next/image";
import { socialLinks } from "./config";

export default function Page() {
  return (
    <section>
      <a href={socialLinks.twitter} target="_blank">
        <Image
          src="/profile.png"
          alt="Profile photo"
          className="rounded-full bg-gray-100 block lg:mt-5 mt-0 lg:mb-5 mb-10 mx-auto sm:float-right sm:ml-5 sm:mb-5 grayscale hover:grayscale-0"
          unoptimized
          width={160}
          height={160}
          priority
        />
      </a>
      
      <h1 className="mb-8 text-2xl font-medium tracking-tight">
        I love to learn & build stuff
      </h1>
      <div className="prose prose-neutral dark:prose-invert">
        <p>
        Hi, I'm Ibrahim V K—a software developer at <a href="https://instalane.co" target="_blank">Instalane</a>, where we build AI powered tools for clients.
        </p>
        <p>
        At seekinmonky, I share my learnings and projects. Along with my work, i'm also pursuing a <a href="https://study.iitm.ac.in/ds/" target="_blank">BS in Data Science & Applications</a> at IIT Madras.
        </p>
        <p>
         I'm interested in learning math, statistics, and machine learning.
        </p>
        <p>
          I believe AI will transform our world in a way we can't even imagine. So the only way to be relevant is to be part of this transformation.
        </p>
        <p>
         I love you all.
        </p>
      </div>
    </section>
  );
}
