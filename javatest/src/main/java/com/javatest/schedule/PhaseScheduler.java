package com.javatest.schedule;

import com.javatest.load.LoadService;
import java.util.concurrent.atomic.AtomicInteger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "javatest.schedule.enabled", havingValue = "true")
public class PhaseScheduler {

    private static final Logger log = LoggerFactory.getLogger(PhaseScheduler.class);

    private final LoadService loadService;
    private final AtomicInteger tickIndex = new AtomicInteger(0);

    public PhaseScheduler(LoadService loadService) {
        this.loadService = loadService;
    }

    @Value("${javatest.schedule.cpu-ms:8000}")
    private long cpuMs;

    @Value("${javatest.schedule.memory-mb:48}")
    private int memoryMb;

    @Value("${javatest.schedule.memory-hold-seconds:15}")
    private int memoryHoldSeconds;

    @Value("${javatest.schedule.thread-count:24}")
    private int threadCount;

    @Value("${javatest.schedule.thread-duration-ms:12000}")
    private long threadDurationMs;

    @Scheduled(
            initialDelayString = "${javatest.schedule.initial-delay-ms:5000}",
            fixedDelayString = "${javatest.schedule.fixed-delay-ms:8000}")
    public void tick() {
        int phase = tickIndex.getAndIncrement() % 4;
        log.info("scheduled_tick phase={} (0=cpu 1=memory 2=threads 3=rest)", phase);
        switch (phase) {
            case 0 -> loadService.runCpuAsync(cpuMs);
            case 1 -> loadService.runMemoryAsync(memoryMb, memoryHoldSeconds);
            case 2 -> loadService.runThreadsAsync(threadCount, threadDurationMs);
            case 3 -> log.info("scheduled_phase=REST");
            default -> {}
        }
    }
}
