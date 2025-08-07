export default async function FrontPageStats(stats: {
    totalReviews: number;
    totalChips: number;
    totalUsers: number;
    totalRatings: number;
}) {
    return (
        <div className='mx-auto w-3/4'>
            <div className="flex flex-col sm:flex-row gap-4 justify-between text-gray-800 font-medium text-center">
                {[
                    { label: 'Restaurants', value: stats.totalChips },
                    { label: 'Recipes', value: 'TBC' },
                    { label: 'Users', value: stats.totalUsers },
                    { label: 'Ratings', value: stats.totalRatings },
                    { label: 'Reviews', value: stats.totalReviews },
                    { label: 'Lists', value: 'TBC' },
                ].map((item, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center justify-center sm:p-3 p-1 bg-gray-100 w-full rounded-md shadow-sm"
                    >
                        <p className="text-xl sm:text-2xl font-bold text-blue-700">{item.value}</p>
                        <p className="text-sm sm:text-base text-gray-600">{item.label}</p>
                    </div>
                ))}
            </div>

        </div>
    );
}