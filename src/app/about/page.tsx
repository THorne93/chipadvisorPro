import Link from 'next/link';

export default function AboutPage() {
    return (
        <div>
            <div className='mb-4'>
                <p>
                    Well, you've finally made it to my site. This has been a developing
                    project for the last 8 or so years. I started with a WordPress to
                    describe my favourite chips, moved on to a crude website that was
                    basically just a remake of my blog. And now, a community driven project
                    designed for everyone to contribute and discover the best chip. So what
                    are you waiting for?
                </p>

                <Link href="/newreview" className="text-blue-600 hover:underline">
                    Start contributing!
                </Link>

            </div>
            <div>
                <h2 className="text-lg font-semibold">Changelog</h2>
                <ul className="list-disc list-inside mt-2">
                    <li>
                        1.0 - Original site basics, main purpose here is to just get it online
                        and see how it functions.
                    </li>
                    <li>
                        1.0.1 - 09/08/25 - Various little bug fixes (login modal opening when it wants, restaurant error handling, drop down menu not closing)
                    </li>
                </ul>
            </div>
        </div>
    );
}
