import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import './HomeLayout.css'

export default function HomeLayout({ children }) {
    return (
        <div className="min-h-screen relative mainBgBg">
            <Header />
            <div className="w-full guest-layout">
                {children}
            </div>
            <Footer />
        </div>
    );
}
