package com.neuralhealer.backend.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Verifies that every incoming request was forwarded by the Go gateway.
 *
 * <p>The gateway injects {@code X-Gateway-Secret} on every proxied request.
 * Any request that arrives without this header — or with the wrong value —
 * is rejected with 403 before Spring Security even runs.  This ensures Spring
 * Boot is unreachable directly even if port 8080 is accidentally exposed.
 *
 * <h3>Filter order</h3>
 * This filter is registered <em>before</em> {@link JwtAuthFilter} in
 * {@link com.neuralhealer.backend.shared.config.SecurityConfig}:
 * <pre>
 *   .addFilterBefore(gatewaySecretFilter, JwtAuthFilter.class)
 * </pre>
 * Placing it after JwtAuthFilter would let unauthenticated direct requests
 * reach the JWT layer before being rejected — defeating the purpose entirely.
 *
 * <h3>Configuration</h3>
 * Set {@code GATEWAY_SECRET} environment variable.  The value must match the
 * {@code GATEWAY_SECRET} env var used by the Go gateway container.
 * <pre>
 *   gateway.secret=${GATEWAY_SECRET:}
 * </pre>
 *
 * <h3>Disabling in local dev (no gateway)</h3>
 * Set {@code GATEWAY_SECRET=} (empty string) in your local {@code .env} or
 * {@code application-dev.yml}.  An empty secret disables the check so the
 * backend is reachable directly during development.
 */
@Component
@Slf4j
public class GatewaySecretFilter extends OncePerRequestFilter {

    private static final String HEADER = "X-Gateway-Secret";

    @Value("${gateway.secret:}")
    private String expectedSecret;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // If no secret is configured the check is disabled (local dev mode).
        if (expectedSecret == null || expectedSecret.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        String incoming = request.getHeader(HEADER);
        if (!expectedSecret.equals(incoming)) {
            log.warn("Blocked direct request — missing or invalid X-Gateway-Secret | ip={} path={}",
                    request.getRemoteAddr(),
                    request.getRequestURI());
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden");
            return;
        }

        filterChain.doFilter(request, response);
    }
}

