package com.ticketdesk.config;

import com.ticketdesk.model.*;
import com.ticketdesk.repository.TicketActivityRepository;
import com.ticketdesk.repository.TicketRepository;
import com.ticketdesk.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final TicketActivityRepository activityRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean seedDemoData;

    public DataInitializer(UserRepository userRepository,
                           TicketRepository ticketRepository,
                           TicketActivityRepository activityRepository,
                           PasswordEncoder passwordEncoder,
                           @Value("${app.seed-demo-data:true}") boolean seedDemoData) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.activityRepository = activityRepository;
        this.passwordEncoder = passwordEncoder;
        this.seedDemoData = seedDemoData;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedDemoData) {
            log.info("Demo data seeding is disabled for this environment.");
            return;
        }

        try {
            log.info("Checking and initializing default demonstration accounts...");

            User admin = userRepository.findByEmail("admin@ticketdesk.local").orElseGet(() -> {
                User u = new User();
                u.setId(UUID.fromString("11111111-1111-1111-1111-111111111111"));
                u.setFullName("System Administrator");
                u.setEmail("admin@ticketdesk.local");
                u.setPasswordHash(passwordEncoder.encode("Admin@12345"));
                u.setRole(Role.ADMINISTRATOR);
                u.setCreatedAt(OffsetDateTime.now());
                u.setUpdatedAt(OffsetDateTime.now());
                User saved = userRepository.save(u);
                log.info("Default administrator seeded: {}", saved.getEmail());
                return saved;
            });

            User agent = userRepository.findByEmail("agent@ticketdesk.local").orElseGet(() -> {
                User u = new User();
                u.setId(UUID.fromString("22222222-2222-2222-2222-222222222222"));
                u.setFullName("Support Agent John");
                u.setEmail("agent@ticketdesk.local");
                u.setPasswordHash(passwordEncoder.encode("Agent@12345"));
                u.setRole(Role.SUPPORT_AGENT);
                u.setCreatedAt(OffsetDateTime.now());
                u.setUpdatedAt(OffsetDateTime.now());
                User saved = userRepository.save(u);
                log.info("Default support agent seeded: {}", saved.getEmail());
                return saved;
            });

            User employee = userRepository.findByEmail("employee@ticketdesk.local").orElseGet(() -> {
                User u = new User();
                u.setId(UUID.fromString("33333333-3333-3333-3333-333333333333"));
                u.setFullName("Jane Employee");
                u.setEmail("employee@ticketdesk.local");
                u.setPasswordHash(passwordEncoder.encode("Employee@12345"));
                u.setRole(Role.EMPLOYEE);
                u.setCreatedAt(OffsetDateTime.now());
                u.setUpdatedAt(OffsetDateTime.now());
                User saved = userRepository.save(u);
                log.info("Default employee seeded: {}", saved.getEmail());
                return saved;
            });

            if (ticketRepository.count() == 0) {
                log.info("Seeding initial tickets for demonstration...");

                Ticket t1 = new Ticket();
                t1.setId(UUID.fromString("44444444-4444-4444-4444-444444444441"));
                t1.setTicketNumber("TKT-000001");
                t1.setSubject("VPN connection dropping repeatedly");
                t1.setDescription("Every 15 minutes, Cisco AnyConnect VPN drops connection to the internal subnet while accessing staging servers.");
                t1.setCategory(TicketCategory.NETWORK);
                t1.setPriority(TicketPriority.HIGH);
                t1.setStatus(TicketStatus.IN_PROGRESS);
                t1.setCreatedBy(employee);
                t1.setAssignedTo(agent);
                t1.setCreatedAt(OffsetDateTime.now());
                t1.setUpdatedAt(OffsetDateTime.now());
                ticketRepository.save(t1);

                activityRepository.save(new TicketActivity(t1, "TICKET_CREATED", null, "OPEN", employee));
                activityRepository.save(new TicketActivity(t1, "TICKET_ASSIGNED", "Unassigned", agent.getFullName(), admin));
                activityRepository.save(new TicketActivity(t1, "STATUS_UPDATED", "OPEN", "IN_PROGRESS", agent));

                Ticket t2 = new Ticket();
                t2.setId(UUID.fromString("44444444-4444-4444-4444-444444444442"));
                t2.setTicketNumber("TKT-000002");
                t2.setSubject("Requesting Docker Desktop and IDE license");
                t2.setDescription("New workstation setup requires Docker Desktop commercial license and IntelliJ IDEA ultimate activation.");
                t2.setCategory(TicketCategory.SOFTWARE);
                t2.setPriority(TicketPriority.MEDIUM);
                t2.setStatus(TicketStatus.OPEN);
                t2.setCreatedBy(employee);
                t2.setCreatedAt(OffsetDateTime.now());
                t2.setUpdatedAt(OffsetDateTime.now());
                ticketRepository.save(t2);

                activityRepository.save(new TicketActivity(t2, "TICKET_CREATED", null, "OPEN", employee));

                log.info("Demonstration tickets seeded successfully.");
            }
        } catch (Exception ex) {
            log.error("Failed to seed demonstration data: {}", ex.getMessage(), ex);
        }
    }
}

