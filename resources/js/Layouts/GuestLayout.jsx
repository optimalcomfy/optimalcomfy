
export default function Guest({ children }) {
    return (
        <div className="min-h-screen relative">
            <div className="w-full">
                {children}
            </div>
        </div>
    );
}
