package com.virtusa.ticketdesk.service;

import com.virtusa.ticketdesk.dto.UserManagementDto;
import com.virtusa.ticketdesk.exception.BadRequestException;
import com.virtusa.ticketdesk.exception.ResourceNotFoundException;
import com.virtusa.ticketdesk.model.Role;
import com.virtusa.ticketdesk.model.User;
import com.virtusa.ticketdesk.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<UserManagementDto.UserSummaryResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserManagementDto.UserSummaryResponse(
                        u.getId(),
                        u.getFullName(),
                        u.getEmail(),
                        u.getRole(),
                        u.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserManagementDto.UserStatsResponse getUserStats() {
        long totalUsers = userRepository.count();
        long employees = userRepository.countByRole(Role.EMPLOYEE);
        long agents = userRepository.countByRole(Role.SUPPORT_AGENT);
        long admins = userRepository.countByRole(Role.ADMINISTRATOR);

        return new UserManagementDto.UserStatsResponse(totalUsers, employees, agents, admins);
    }

    @Transactional
    public UserManagementDto.UserSummaryResponse updateUserRole(UUID userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Protect last administrator account rule
        if (user.getRole() == Role.ADMINISTRATOR && newRole != Role.ADMINISTRATOR) {
            long adminCount = userRepository.countByRole(Role.ADMINISTRATOR);
            if (adminCount <= 1) {
                throw new BadRequestException("Cannot demote the last administrator account. At least one Administrator must remain.");
            }
        }

        user.setRole(newRole);
        User updated = userRepository.save(user);

        return new UserManagementDto.UserSummaryResponse(
                updated.getId(),
                updated.getFullName(),
                updated.getEmail(),
                updated.getRole(),
                updated.getCreatedAt()
        );
    }
}
