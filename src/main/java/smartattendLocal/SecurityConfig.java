package smartattendLocal;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable()) // disable CSRF for JS fetch
                .cors(cors -> {})             // enable CORS
                .authorizeHttpRequests(auth -> auth
                        // Public routes
                        .requestMatchers(
                                "/",
                                "/status",
                                "/index.html",
                                "/body/login.html",
                                "/body/registration.html",
                                "/style/**",
                                "/assets/**",
                                "/script/**",
                                "/js/**",
                                "/teacher/login",
                                "/teacher/forgot-password",
                                "/teacher/verify-otp",
                                "/teacher/reset-password",
                                "students/all"
                        ).permitAll()

                        // Teacher-only routes
                        .requestMatchers(
                                "/teacher/dashboard/**",
                                "/students/my-students",
                                "/students/count/my-students",
                                "/students/add",
                                "/cards/**"
                        ).hasRole("TEACHER")

                        // Admin-only routes
                        .requestMatchers(
                                "/teacher/approve/**",
                                "/teacher/delete/**"
                        ).hasRole("ADMIN")

                        // Any other route requires authentication
                        .anyRequest().authenticated()
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/body/login.html")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                );

        return http.build();
    }

    // CORS configuration for local
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(Arrays.asList("http://localhost:5500"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}