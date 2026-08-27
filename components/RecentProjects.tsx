import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export const projects = [
  {
    id: 1,
    titleKey: "listening_section_title",
    desKey: "listening_section_des",
    img: "/mus.png",
    iconLists: [],
    link: "/main",
  },
  {
    id: 2,
    titleKey: "reading_section_title",
    desKey: "reading_section_des",
    img: "/books.png",
    iconLists: [],
    link: "/main",
  },
  {
    id: 3,
    titleKey: "writing_section_title",
    desKey: "writing_section_des",
    img: "/essa.png",
    iconLists: [],
    link: "/main",
  },
  {
    id: 4,
    titleKey: "speaking_section_title",
    desKey: "speaking_section_des",
    img: "/voc.png",
    iconLists: [],
    link: "/main",
  },
  {
    id: 5,
    titleKey: "ielts_recommendations_title",
    desKey: "ielts_recommendations_des",
    img: "/tips.png",
    iconLists: [],
    link: "/main",
  },
  {
    id: 6,
    titleKey: "applying_to_university_title",
    desKey: "applying_to_university_des",
    img: "/univ.png",
    iconLists: [],
    link: "/main",
  },
];

const RecentProjects = () => {
  const { t } = useTranslation();

  return (
    <section id="recent-projects" className="pt-20 pb-12">
      <h2 className="text-3xl font-bold text-center mb-8 text-black">
        {t("what_leadai_offers")} <span className="text-black">{t("you")}</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <Link key={project.id} href={project.link} passHref>
            <div
              className="cursor-pointer transform hover:scale-105 transition-transform duration-300 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center text-center"
              style={{
                backgroundColor:
                  project.id === 2 || project.id === 4 || project.id === 6
                    ? "#000000"
                    : "#810021",
                height: "20rem",
              }}
            >
              <Image
                src={project.img}
                alt={t(project.titleKey)}
                width={80}
                height={80}
                className="mb-4 w-20 h-20 object-cover rounded-lg"
              />
              <h3 className="text-2xl font-semibold mb-2 text-white">
                {t(project.titleKey)}
              </h3>
              <p className="text-sm text-white max-w-xs">{t(project.desKey)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecentProjects;
