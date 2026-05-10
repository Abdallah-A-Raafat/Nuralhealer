package com.neuralhealer.backend.feature.doctor.controller;

import com.neuralhealer.backend.feature.doctor.dto.DoctorResponse;
import com.neuralhealer.backend.feature.doctor.entity.DoctorProfile;
import com.neuralhealer.backend.feature.doctor.repository.DoctorProfileRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctors", description = "Doctor management and directory endpoints")
public class DoctorController {

    private final DoctorProfileRepository doctorProfileRepository;
    private final com.neuralhealer.backend.feature.doctor.repository.DoctorPatientRepository doctorPatientRepository;
    private final com.neuralhealer.backend.feature.ai.service.ChatStorageService chatStorageService;
    private final com.neuralhealer.backend.feature.engagement.repository.EngagementRepository engagementRepository; 

    @GetMapping
    @Operation(summary = "Get all doctors", description = "List all available doctor profiles")
    public ResponseEntity<List<DoctorResponse>> getAllDoctors() {
        List<DoctorResponse> doctors = doctorProfileRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/patients/{patientId}/chats")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<com.neuralhealer.backend.feature.ai.entity.AiChatSession> getPatientChats(
            @org.springframework.web.bind.annotation.PathVariable java.util.UUID patientId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.neuralhealer.backend.shared.entity.User user) {

        if (!user.isDoctor()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Only doctors can access this endpoint");
        }

        java.util.UUID doctorUserId = user.getId();

        // ✅ Eagerly fetch patient + user to avoid LazyInitializationException
        List<com.neuralhealer.backend.feature.engagement.entity.Engagement> engagements =
            engagementRepository.findByDoctorUserIdWithPatient(doctorUserId);

        // ✅ Find the engagement matching this patient (by user ID or profile ID)
        com.neuralhealer.backend.feature.engagement.entity.Engagement matchedEngagement = engagements.stream()
            .filter(e -> {
                java.util.UUID ePatientUserId = e.getPatient().getUser().getId();
                java.util.UUID ePatientProfileId = e.getPatient().getId();
                return patientId.equals(ePatientUserId) || patientId.equals(ePatientProfileId);
            })
            .filter(e -> {
                if (e.getStatus() == com.neuralhealer.backend.feature.engagement.enums.EngagementStatus.active) return true;
                if (e.getStatus() == com.neuralhealer.backend.feature.engagement.enums.EngagementStatus.ended) {
                    var rule = e.getAccessRule();
                    return rule != null && Boolean.TRUE.equals(rule.getRetainsHistoryAccess());
                }
                return false;
            })
            .findFirst()
            .orElse(null);

        if (matchedEngagement == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "You do not have access to this patient's chats");
        }

        // ✅ Always use the patient PROFILE ID for getUserSessions
        java.util.UUID patientProfileId = matchedEngagement.getPatient().getId();
        return chatStorageService.getUserSessions(patientProfileId);
    }

    @GetMapping("/patients/{patientId}/chats/{sessionId}/messages")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<com.neuralhealer.backend.feature.ai.entity.AiChatMessage> getPatientChatMessages(
            @org.springframework.web.bind.annotation.PathVariable java.util.UUID patientId,
            @org.springframework.web.bind.annotation.PathVariable java.util.UUID sessionId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.neuralhealer.backend.shared.entity.User user) {

        if (!user.isDoctor()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Only doctors can access this endpoint");
        }

        java.util.UUID doctorUserId = user.getId();

        List<com.neuralhealer.backend.feature.engagement.entity.Engagement> engagements =
            engagementRepository.findByDoctorUserIdWithPatient(doctorUserId);

        boolean hasAccess = engagements.stream()
            .anyMatch(e -> {
                java.util.UUID ePatientUserId = e.getPatient().getUser().getId();
                java.util.UUID ePatientProfileId = e.getPatient().getId();
                boolean patientMatch = patientId.equals(ePatientUserId) || patientId.equals(ePatientProfileId);
                if (!patientMatch) return false;
                if (e.getStatus() == com.neuralhealer.backend.feature.engagement.enums.EngagementStatus.active) return true;
                if (e.getStatus() == com.neuralhealer.backend.feature.engagement.enums.EngagementStatus.ended) {
                    var rule = e.getAccessRule();
                    return rule != null && Boolean.TRUE.equals(rule.getRetainsHistoryAccess());
                }
                return false;
            });

        if (!hasAccess) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "You do not have access to this patient's chats");
        }

        return chatStorageService.getSessionMessages(sessionId);
    }

    private DoctorResponse mapToResponse(DoctorProfile p) {
        return new DoctorResponse(
                p.getId(),
                p.getUser().getId(),
                p.getUser().getFirstName(),
                p.getUser().getLastName(),
                p.getUser().getEmail(),
                p.getTitle(),
                p.getBio(),
                p.getSpecialities(),
                p.getExperienceYears(),
                p.getLocationCity(),
                p.getLocationCountry(),
                p.getIsVerified());
    }
}
