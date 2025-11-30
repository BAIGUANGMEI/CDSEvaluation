// src/utils.js
import { SignJWT, jwtVerify } from 'jose';

// --- Response Helpers ---

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function jsonResponse(data, status = 200, msg = "Success") {
  const responseBody = {
    code: status,
    data: data,
    msg: msg
  };
  
  return new Response(JSON.stringify(responseBody), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

export function errorResponse(message, status = 400) {
  // For errors, data can be null or empty object
  return jsonResponse(null, status, message);
}

export async function parseBody(request) {
  try {
    return await request.json();
  } catch (e) {
    return {};
  }
}

export function corsOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// --- Crypto / Auth Helpers ---

const DEFAULT_SECRET = "HKU-CDS-SERVER-SECRET";

function getSecret(env) {
  return env.JWT_SECRET || DEFAULT_SECRET;
}

// PBKDF2 Hash (Keep existing robust implementation)
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  
  const exportedKey = await crypto.subtle.exportKey("raw", key);
  const saltHex = [...salt].map(b => b.toString(16).padStart(2, '0')).join('');
  const keyHex = [...new Uint8Array(exportedKey)].map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${saltHex}:${keyHex}`;
}

export async function verifyPassword(storedPassword, providedPassword) {
  try {
    const [saltHex, keyHex] = storedPassword.split(':');
    if (!saltHex || !keyHex) return false;
    
    const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const encoder = new TextEncoder();
    
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(providedPassword),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    
    const exportedKey = await crypto.subtle.exportKey("raw", key);
    const derivedKeyHex = [...new Uint8Array(exportedKey)].map(b => b.toString(16).padStart(2, '0')).join('');
    
    return derivedKeyHex === keyHex;
  } catch (e) {
    return false;
  }
}

// JWT Implementation
export async function createToken(user, env) {
  const secret = new TextEncoder().encode(getSecret(env));
  const jwt = await new SignJWT({ 
      sub: user.id, 
      username: user.username, 
      role: user.role 
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
  
  return jwt;
}

export async function verifyToken(token, env) {
  try {
    const secret = new TextEncoder().encode(getSecret(env));
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (e) {
    // Token verification failed (expired, invalid signature, etc.)
    return null;
  }
}

export async function getCurrentUser(request, env) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  return await verifyToken(token, env);
}

export async function requireAuth(request, env, role = null) {
  const user = await getCurrentUser(request, env);
  if (!user) return null;
  if (role && user.role !== role) return null;
  return user;
}
