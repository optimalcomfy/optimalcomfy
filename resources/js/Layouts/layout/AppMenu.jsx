import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';
import { usePage } from '@inertiajs/react';

const AppMenu = () => {
    const { auth } = usePage().props;

    const roleId = auth.user?.role_id;

    const model = [
        {
            label: 'Home',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: route('dashboard'), roles: [1, 2, 3] },
                { label: 'Users', icon: 'pi pi-fw pi-users', to: route('users.index'), roles: [1] },
                { label: 'Profile', icon: 'pi pi-fw pi-user', to: route('profile.edit'), roles: [1, 2, 3] },
                { label: 'Notifications', icon: 'pi pi-fw pi-bell', to: route('notifications.index'), roles: [1] },
            ]
        },
        {
            label: 'Hotel Management',
            items: [
                { label: 'Rooms', icon: 'pi pi-fw pi-building', to: route('rooms.index'), roles: [1, 2] },
                { label: 'Room Bookings', icon: 'pi pi-fw pi-calendar', to: route('bookings.index'), roles: [1, 2] },
                { label: 'Services', icon: 'pi pi-fw pi-cog', to: route('services.index'), roles: [1, 2] },
                { label: 'Service Bookings', icon: 'pi pi-fw pi-check-square', to: route('serviceBookings.index'), roles: [1, 2] },
            ]
        },
        {
            label: 'Car hire Management',
            items: [
                { label: 'Cars', icon: 'pi pi-fw pi-car', to: route('cars.index'), roles: [1, 2] },
                { label: 'Car Bookings', icon: 'pi pi-fw pi-calendar', to: route('car-bookings.index'), roles: [1, 2] },
                { label: 'Car Categories', icon: 'pi pi-fw pi-tags', to: route('car-categories.index'), roles: [1, 2] },
                { label: 'Car Features', icon: 'pi pi-fw pi-check-square', to: route('car-features.index'), roles: [1, 2] },
                { label: 'Car Media', icon: 'pi pi-fw pi-image', to: route('car-medias.index'), roles: [1, 2] },                
            ]
        },
        {
            label: 'Food & Orders',
            items: [
                { label: 'Food', icon: 'pi pi-fw pi-shopping-cart', to: route('foods.index'), roles: [1, 2] },
                { label: 'Food Orders', icon: 'pi pi-fw pi-box', to: route('foodOrders.index'), roles: [1, 2] },
                { label: 'Food Order Items', icon: 'pi pi-fw pi-list', to: route('foodOrderItems.index'), roles: [1, 2] },
            ]
        },
        {
            label: 'Payments & Reviews',
            items: [
                { label: 'Payments', icon: 'pi pi-fw pi-credit-card', to: route('payments.index'), roles: [1, 2] },
                { label: 'Reviews', icon: 'pi pi-fw pi-star', to: route('reviews.index'), roles: [1, 2, 3] },
            ]
        },
    ];    

    const filteredModel = model.map(section => ({
        ...section,
        items: section.items.filter(item => item.roles.includes(roleId)),
    })).filter(section => section.items.length > 0); 

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {filteredModel.map((item, i) => {
                    return !item?.separator ? 
                        <AppMenuitem item={item} root={true} index={i} key={item?.label} />
                     : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
