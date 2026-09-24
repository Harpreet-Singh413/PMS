package com.example.SpringBoot_Backend.DTO;

import com.example.SpringBoot_Backend.Model.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private Role role;
}
