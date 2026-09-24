package com.example.SpringBoot_Backend.Service;

import com.example.SpringBoot_Backend.DTO.LoginRequest;
import com.example.SpringBoot_Backend.DTO.LoginResponse;
import com.example.SpringBoot_Backend.DTO.RegisterRequest;
import com.example.SpringBoot_Backend.DTO.UserResponse;
import com.example.SpringBoot_Backend.Exception.DuplicateEmailException;
import com.example.SpringBoot_Backend.Model.Role;
import com.example.SpringBoot_Backend.Model.User;
import com.example.SpringBoot_Backend.Repository.UserRepo;
import com.example.SpringBoot_Backend.Security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        userRepo.findByEmail(request.getEmail().toLowerCase()).ifPresent(u -> {
            throw new DuplicateEmailException("Email already registered");
        });

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepo.save(user);

        return UserResponse.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .build();
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepo.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();

        return LoginResponse.builder()
                .token(token)
                .user(userResponse)
                .build();
    }
}
