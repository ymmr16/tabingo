export interface Activity {
  id: string;
  name: string;
  completed: boolean;
}

export interface Trip {
  code: string;
  name: string;
  activities: Activity[];
}

