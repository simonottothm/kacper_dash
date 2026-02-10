#!/usr/bin/env node

/**
 * Script to create an admin user in Supabase
 * Usage: node scripts/create-admin-user.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const EMAIL = 'admin@kacperguz.de';
const PASSWORD = 'Leads2026!';

async function createAdminUser() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
        console.error('Make sure .env.local is properly configured');
        process.exit(1);
    }

    console.log('🔧 Creating admin user...');
    console.log(`📧 Email: ${EMAIL}`);

    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
            },
            body: JSON.stringify({
                email: EMAIL,
                password: PASSWORD,
                email_confirm: true,
                user_metadata: {
                    full_name: 'Admin User',
                },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.msg && data.msg.includes('already registered')) {
                console.log('ℹ️  User already exists');
                console.log('✅ You can now login with:');
                console.log(`   Email: ${EMAIL}`);
                console.log(`   Password: ${PASSWORD}`);
                return;
            }
            throw new Error(data.msg || data.message || 'Failed to create user');
        }

        console.log('✅ Admin user created successfully!');
        console.log(`   User ID: ${data.id}`);
        console.log(`   Email: ${data.email}`);
        console.log('');
        console.log('🔑 Login credentials:');
        console.log(`   Email: ${EMAIL}`);
        console.log(`   Password: ${PASSWORD}`);
        console.log('');
        console.log('⚠️  Note: You need to assign this user to a tenant with admin role');
        console.log('   to access admin features.');

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        process.exit(1);
    }
}

createAdminUser();
