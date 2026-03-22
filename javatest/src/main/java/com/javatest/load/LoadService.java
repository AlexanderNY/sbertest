package com.javatest.load;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class LoadService {

    private static final Logger log = LoggerFactory.getLogger(LoadService.class);

    private final List<byte[]> heldMemory = Collections.synchronizedList(new ArrayList<>());
    private final ExecutorService async = Executors.newCachedThreadPool(r -> {
        Thread t = new Thread(r, "load-async");
        t.setDaemon(true);
        return t;
    });

    public void runCpuAsync(long durationMs) {
        async.submit(() -> runCpu(durationMs));
    }

    public void runCpu(long durationMs) {
        log.info("phase=CPU_START durationMs={} {}", durationMs, LoadMetrics.snapshot());
        long deadline = System.nanoTime() + TimeUnit.MILLISECONDS.toNanos(Math.max(1, durationMs));
        long x = 0L;
        while (System.nanoTime() < deadline) {
            x += (x * 31 + 17) % 1_000_003;
        }
        log.info("phase=CPU_END checksum={} {}", x, LoadMetrics.snapshot());
    }

    public void runMemoryAsync(int megabytes, int holdSeconds) {
        async.submit(() -> runMemory(megabytes, holdSeconds));
    }

    public void runMemory(int megabytes, int holdSeconds) {
        int mb = Math.max(1, Math.min(megabytes, 512));
        int hold = Math.max(1, Math.min(holdSeconds, 300));
        log.info("phase=MEMORY_START allocateMiB={} holdSeconds={} {}", mb, hold, LoadMetrics.snapshot());
        int chunk = 1024 * 1024;
        for (int i = 0; i < mb; i++) {
            heldMemory.add(new byte[chunk]);
        }
        log.info("phase=MEMORY_ALLOCATED {} {}", mb, LoadMetrics.snapshot());
        try {
            Thread.sleep(TimeUnit.SECONDS.toMillis(hold));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("phase=MEMORY_INTERRUPTED");
        }
        heldMemory.clear();
        log.info("phase=MEMORY_RELEASED {} {}", mb, LoadMetrics.snapshot());
    }

    public void runThreadsAsync(int threadCount, long durationMs) {
        async.submit(() -> runThreads(threadCount, durationMs));
    }

    public void runThreads(int threadCount, long durationMs) {
        int n = Math.max(1, Math.min(threadCount, 256));
        long ms = Math.max(100, Math.min(durationMs, 600_000));
        log.info("phase=THREADS_START n={} durationMs={} {}", n, ms, LoadMetrics.snapshot());
        ExecutorService pool = Executors.newFixedThreadPool(n, r -> {
            Thread t = new Thread(r, "load-worker");
            t.setDaemon(true);
            return t;
        });
        AtomicBoolean running = new AtomicBoolean(true);
        for (int i = 0; i < n; i++) {
            final int idx = i;
            pool.submit(
                    () -> {
                        long x = 0;
                        while (running.get() && !Thread.currentThread().isInterrupted()) {
                            try {
                                Thread.sleep(50);
                            } catch (InterruptedException e) {
                                Thread.currentThread().interrupt();
                                break;
                            }
                            x += (x * 13 + idx) % 997;
                        }
                        return x;
                    });
        }
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            running.set(false);
            pool.shutdownNow();
            try {
                pool.awaitTermination(30, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        log.info("phase=THREADS_END n={} {} {}", n, ms, LoadMetrics.snapshot());
    }
}
