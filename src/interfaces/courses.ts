export interface ILesson {
  title: string;
  href: string;
}

export interface ICreateCourse {
  title: string;
  category: string;
  lessons: ILesson[];
}

export type IUpdateCourse = Partial<ICreateCourse>;

export interface ICourse {
  id: number;
  title: string;
  category: string;
  lessons: ILesson[];
  createdAt: Date;
  updatedAt: Date;
}
