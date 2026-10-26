/**
 * Madras Macha — Administrator Provisioning Script
 * Usage: npx tsx scripts/promote-admin.ts <username_or_email>
 * Safe server-side procedure to promote a verified account to 'transit_admin'.
 * Never exposed to frontend clients.
 */
import 'dotenv/config';
import { findUserByIdentifier, updateUser } from '../src/lib/server/authStore';

async function main() {
  const target = process.argv[2];
  if (!target) {
    console.error('Error: Please provide a username or email to promote.');
    console.error('Example: npx tsx scripts/promote-admin.ts admin_transit');
    process.exit(1);
  }

  console.log(`[Admin Provisioning] Looking up user: "${target}"...`);
  const user = await findUserByIdentifier(target);

  if (!user) {
    console.error(`Error: User "${target}" not found in database.`);
    process.exit(1);
  }

  if (user.role === 'transit_admin') {
    console.log(`User "${user.username}" (${user.email}) is already a transit_admin.`);
    process.exit(0);
  }

  const updated = await updateUser(user.id, { role: 'transit_admin' });
  if (updated && updated.role === 'transit_admin') {
    console.log(`Successfully promoted "${user.username}" (${user.email}) to role: transit_admin!`);
    console.log(`User ID: ${user.id}`);
  } else {
    console.error(`Failed to update user role.`);
    process.exit(1);
  }
}

main().catch(console.error);
