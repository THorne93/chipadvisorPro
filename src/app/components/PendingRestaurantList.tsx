'use client';
import { useState } from 'react';
import { message, Button } from 'antd';

export default function PendingRestaurantList({ pending }: { pending: any[] }) {
    const [list, setList] = useState(pending);

    const handleAction = async (id: number, action: 'confirm' | 'reject') => {
        const endpoint = `/api/restaurants/${action}`;
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (!res.ok) throw new Error(`Failed to ${action} restaurant`);

            message.success(`Restaurant ${action}ed successfully`);

            // Remove from list
            setList(prev => prev.filter(r => r.id !== id));
        } catch (err: any) {
            console.error(err);
            message.error(`Error: ${err.message}`);
        }
    };

    if (!list.length) return <p className="text-center my-4 text-gray-600">No pending restaurants.</p>;

    return (
        <ul className="divide-y divide-gray-200 p-4">
            {list.map(rest => (
                <li key={rest.id} className="p-4 rounded-md bg-white shadow-sm mb-4 border">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        {/* Image Column */}
                        {rest.img_url && (
                            <div className="sm:w-1/4 flex justify-center">
                                <img
                                    src={rest.img_url}
                                    alt="Restaurant"
                                    className="w-full h-full object-cover rounded border"
                                />
                            </div>
                        )}

                        {/* Content Column */}
                        <div className="sm:w-2/5">
                            <p><span className="font-semibold">Restaurant Name:</span> {rest.name}</p>
                            <p><span className="font-semibold">Score:</span> {rest.score} / 5</p>
                            <p><span className="font-semibold">Created at:</span> {new Date(rest.createdAt).toLocaleString()}</p>

                            {rest.location && (
                                <p>
                                    <span className="font-semibold">Location:</span> {rest.location.address}, {rest.location.city}, {rest.location.country}
                                </p>
                            )}

                            <p><span className="font-semibold">Title:</span> {rest.title}</p>
                            <p className="mt-2"><span className="font-semibold">Content:</span> {rest.content}</p>
                        </div>

                        {/* Action Buttons Column */}
                        <div className="sm:w-1/4 flex sm:flex-col gap-2 sm:items-end sm:justify-center">
                            <Button type="primary" onClick={() => handleAction(rest.id, 'confirm')}>Confirm</Button>
                            <Button danger onClick={() => handleAction(rest.id, 'reject')}>Reject</Button>
                        </div>
                    </div>
                </li>

            ))}
        </ul>
    );
}
