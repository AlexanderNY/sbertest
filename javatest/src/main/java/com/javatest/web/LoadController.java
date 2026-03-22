package com.javatest.web;

import com.javatest.load.LoadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/load")
public class LoadController {

    private final LoadService loadService;

    public LoadController(LoadService loadService) {
        this.loadService = loadService;
    }

    @PostMapping("/cpu")
    public ResponseEntity<String> cpu(@RequestParam(defaultValue = "5000") long ms) {
        loadService.runCpuAsync(ms);
        return ResponseEntity.accepted().body("CPU load scheduled for " + ms + " ms");
    }

    @PostMapping("/memory")
    public ResponseEntity<String> memory(
            @RequestParam(defaultValue = "64") int mb,
            @RequestParam(defaultValue = "20") int holdSeconds) {
        loadService.runMemoryAsync(mb, holdSeconds);
        return ResponseEntity.accepted()
                .body("Memory load scheduled: " + mb + " MiB for " + holdSeconds + " s");
    }

    @PostMapping("/threads")
    public ResponseEntity<String> threads(
            @RequestParam(defaultValue = "32") int n,
            @RequestParam(defaultValue = "30000") long ms) {
        loadService.runThreadsAsync(n, ms);
        return ResponseEntity.accepted().body("Thread load scheduled: n=" + n + " for " + ms + " ms");
    }
}
