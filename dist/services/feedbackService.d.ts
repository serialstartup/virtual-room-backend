export type FeedbackType = 'like' | 'dislike' | 'neutral';
export type FeedbackSource = 'heart' | 'thumbs';
export type WorkflowType = 'classic' | 'avatar' | 'text-to-fashion' | 'product-to-model';
export interface TryOnFeedback {
    id: string;
    user_id: string;
    try_on_id: string;
    try_on_type: WorkflowType;
    feedback_type: FeedbackType;
    feedback_source: FeedbackSource;
    created_at: string;
    updated_at: string;
}
export declare class FeedbackService {
    static getFeedback(userId: string, tryOnId: string, feedbackSource: FeedbackSource): Promise<TryOnFeedback | null>;
    static setFeedback(userId: string, tryOnId: string, tryOnType: WorkflowType, feedbackSource: FeedbackSource, feedbackType: FeedbackType): Promise<TryOnFeedback>;
    static removeFeedback(userId: string, tryOnId: string, feedbackSource: FeedbackSource): Promise<void>;
    static getUserFeedback(userId: string): Promise<TryOnFeedback[]>;
    static getUserFeedbackStats(userId: string): Promise<any>;
}
