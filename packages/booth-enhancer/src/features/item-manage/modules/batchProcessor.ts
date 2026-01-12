/**
 * 异步批处理工具
 * 将大量任务分批处理，避免阻塞主线程
 */
export class BatchProcessor<T> {
    private queue: T[] = [];
    private isProcessing = false;

    /**
     * 批处理任务
     * @param items 待处理的项目列表
     * @param processor 处理单个项目的函数
     * @param batchSize 每批处理的数量（增大以提高性能）
     * @param onComplete 完成回调
     */
    async process(
        items: T[],
        processor: (item: T) => void,
        batchSize: number = 20,
        onComplete?: (processedCount: number) => void
    ): Promise<void> {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.queue = [...items];
        let processedCount = 0;

        const processBatch = (): void => {
            const batch = this.queue.splice(0, batchSize);
            
            batch.forEach(item => {
                processor(item);
                processedCount++;
            });

            if (this.queue.length > 0) {
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(processBatch, { timeout: 1000 });
                } else {
                    setTimeout(processBatch, 16);
                }
            } else {
                this.isProcessing = false;
                onComplete?.(processedCount);
            }
        };

        processBatch();
    }
}
