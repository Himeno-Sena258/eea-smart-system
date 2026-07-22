-- Insert into student_score with IGNORE to handle duplicates
INSERT IGNORE INTO `student_score` (`id`, `student_id`, `teaching_class_id`, `assessment_item_id`, `actual_score`) VALUES
(70001, 201, 1, 1, 16.00),
(70002, 201, 1, 2, 32.00),
(70003, 201, 1, 3, 30.00),
(70004, 201, 1, 4, 42.00),
(70005, 201, 1, 5, 43.00),
(70006, 201, 1, 6, 85.00);
