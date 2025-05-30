import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';
import { usePage } from '@inertiajs/react';

const AppMenu = () => {
    const { auth } = usePage().props;

    const roleId = parseInt(auth.user?.role_id);

    const model = [
        {
            label: 'Home',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: route('dashboard'), roles: [1, 2, 3] },
                { label: 'Users', icon: 'pi pi-fw pi-users', to: route('users.index'), roles: [1] },
                { label: 'Profile', icon: 'pi pi-fw pi-user', to: route('profile.edit'), roles: [1, 2, 3] }
            ]
        },
        {
            label: 'Property Management',
            items: [
                { label: 'Properties', icon: 'pi pi-fw pi-building', to: route('properties.index'), roles: [1, 2] },
                { label: 'Property Bookings', icon: 'pi pi-fw pi-calendar', to: route('bookings.index'), roles: [1, 2,3] }
            ]
        },
        {
            label: 'Car hire Management',
            items: [
                { label: 'Cars', icon: 'pi pi-fw pi-car', to: route('main-cars.index'), roles: [1, 2] },
                { label: 'Car Bookings', icon: 'pi pi-fw pi-calendar', to: route('car-bookings.index'), roles: [1, 2, 3] },
                { label: 'Car Categories', icon: 'pi pi-fw pi-tags', to: route('car-categories.index'), roles: [1, 2] }               
            ]
        },
        {
            label: 'Payments & Reviews',
            items: [
                { label: 'Payments', icon: 'pi pi-fw pi-credit-card', to: route('payments.index'), roles: [1, 3] },
                { label: 'Host wallet', icon: 'pi pi-fw pi-credit-card', to: route('wallet'), roles: [2] },
                // { label: 'Reviews', icon: 'pi pi-fw pi-star', to: route('reviews.index'), roles: [1, 2, 3] },
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
