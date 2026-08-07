export type AccuracyTestType = 
  | 'target_precision' 
  | 'corner_placement' 
  | 'distance_accuracy' 
  | 'two_foot_accuracy' 
  | 'moving_accuracy' 
  | 'pressure_accuracy';

export interface Point2D {
  x: number; // نسبة مئوية 0 إلى 100
  y: number; // نسبة مئوية 0 إلى 100
}

export interface ShotAttempt {
  testType: AccuracyTestType;
  distance: number;
  target: Point2D;
  result: Point2D;
  score: number;
  foot: 'right' | 'left';
  timestamp: number;
}