export type Course = {
  id: string;
  title: string;
  level: "Kids" | "Teens" | "Adults";
  language: "RU" | "EN";
  lessons: number;
  durationHours: number;
  price: number;
  cover: string;
};

export const mockCourses: Course[] = [
  {
    id: "eng-kids-a1",
    title: "Английский для детей A1",
    level: "Kids",
    language: "RU",
    lessons: 24,
    durationHours: 12,
    price: 2990,
    cover: "https://picsum.photos/seed/eng-kids/600/400"
  },
  {
    id: "math-teens",
    title: "Математика для подростков (подготовка к экзаменам)",
    level: "Teens",
    language: "RU",
    lessons: 36,
    durationHours: 18,
    price: 3990,
    cover: "https://picsum.photos/seed/math-teens/600/400"
  },
  {
    id: "eng-adults-b1",
    title: "English Boost B1 для взрослых",
    level: "Adults",
    language: "EN",
    lessons: 30,
    durationHours: 15,
    price: 4590,
    cover: "https://picsum.photos/seed/eng-adults/600/400"
  }
];
