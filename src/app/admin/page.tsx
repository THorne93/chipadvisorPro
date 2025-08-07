import { getPendingRestaurants, getSession } from "@/lib";
import PendingRestaurantList from "../components/PendingRestaurantList";
import { redirect } from "next/navigation";

export default async function AdminPage() {
    const session = await getSession();

    // ❌ Not signed in
    if (!session) {
        redirect('/');
    }

    // ❌ Not an admin
    if (session.user.role !== 'ADMIN') {
        redirect('/');
    }
    const pending = await getPendingRestaurants();

    return (
        <div className="mt-2 mx-auto w-3/4 rounded-md bg-gray-50">
            <h1 className="text-3xl py-1 font-bold text-center">Admin Dashboard</h1>
            <p className="text-center mb-4">Manage pending restaurant submissions below.</p>

            <PendingRestaurantList pending={pending} />
        </div>
    );
}
