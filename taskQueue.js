/**
 * Task Queue Manager
 * Manages asynchronous task queuing and execution
 */

class TaskQueue {
  constructor(concurrency = 3) {
    this.queue = [];
    this.running = 0;
    this.concurrency = concurrency;
    this.completed = [];
    this.failed = [];
  }

  enqueue(task, priority = 0) {
    const queueItem = {
      id: this.generateId(),
      task,
      priority,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.queue.push(queueItem);
    this.queue.sort((a, b) => b.priority - a.priority);
    this.process();
    return queueItem.id;
  }

  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const item = this.queue.shift();
    item.status = 'running';

    try {
      await item.task();
      item.status = 'completed';
      this.completed.push(item);
    } catch (error) {
      item.status = 'failed';
      item.error = error.message;
      this.failed.push(item);
    }

    this.running--;
    this.process();
  }

  generateId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStats() {
    return {
      pending: this.queue.length,
      running: this.running,
      completed: this.completed.length,
      failed: this.failed.length,
    };
  }

  clear() {
    this.queue = [];
  }
}

module.exports = TaskQueue;
