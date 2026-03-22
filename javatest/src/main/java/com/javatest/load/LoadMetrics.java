package com.javatest.load;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.ThreadMXBean;

public final class LoadMetrics {

    private static final MemoryMXBean MEMORY = ManagementFactory.getMemoryMXBean();
    private static final ThreadMXBean THREADS = ManagementFactory.getThreadMXBean();

    private LoadMetrics() {}

    public static String snapshot() {
        long heapUsed = MEMORY.getHeapMemoryUsage().getUsed();
        long heapMax = MEMORY.getHeapMemoryUsage().getMax();
        int threadCount = THREADS.getThreadCount();
        return String.format(
                "heapUsed=%dMiB heapMax=%dMiB threads=%d",
                heapUsed / (1024 * 1024),
                heapMax > 0 ? heapMax / (1024 * 1024) : -1,
                threadCount);
    }
}
