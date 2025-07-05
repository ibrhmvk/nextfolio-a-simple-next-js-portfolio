"use client";

import React from "react";
import { FaXTwitter, FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { TbMailFilled } from "react-icons/tb";
import { metaData, socialLinks } from "app/config";
import BitcoinPrice from "./view-counter";

const YEAR = new Date().getFullYear();

function SocialLink({ href, icon: Icon }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200"
    >
      <Icon />
    </a>
  );
}

function SocialLinks() {
  return (
    <div className="flex text-lg gap-4">
      <SocialLink href={socialLinks.twitter} icon={FaXTwitter} />
      <SocialLink href={socialLinks.github} icon={FaGithub} />
      <SocialLink href={socialLinks.linkedin} icon={FaLinkedinIn} />
      <SocialLink href={socialLinks.email} icon={TbMailFilled} />
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="block lg:mt-24 mt-16 text-[#1C1C1C] dark:text-[#D4D4D4]">
      <div className="flex flex-row justify-between items-center">
        <div className="flex items-center">
          {/* <time className="font-medium">© {YEAR}</time>{" "}
            <a
              className="ml-2 no-underline font-medium hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
            >
              {metaData.title}
            </a> */}
                      <BitcoinPrice />
        </div>
        <SocialLinks />
      </div>
      <style jsx>{`
        @media screen and (max-width: 480px) {
          article {
            padding-top: 2rem;
            padding-bottom: 4rem;
          }
        }
      `}</style>
    </footer>
  );
}
