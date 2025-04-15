import Footer from "@/Components/Footer";
import Header from "@/Components/Header";

export default function HomeLayout({ children }) {
    return (
        <div className="min-h-screen relative">
            <Header />
            <div className="w-full guest-layout">
                {children}
            </div>
            <Footer />
        </div>
    );
}
