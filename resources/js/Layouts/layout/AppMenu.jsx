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
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: route('dashboard'), roles: [1, 2, 3, 4] },
                { label: 'Users', icon: 'pi pi-fw pi-users', to: route('users.index'), roles: [1, 2] },
                { label: 'Profile', icon: 'pi pi-fw pi-user', to: route('profile.edit'), roles: [1, 2, 3, 4] }
            ]
        },
        {
            label: 'Stays Management',
            items: [
                { label: 'Stays', icon: 'pi pi-fw pi-building', to: route('properties.index'), roles: [1, 2] },
                { label: 'Stays Bookings', icon: 'pi pi-fw pi-calendar', to: route('bookings.index'), roles: [1, 2,3] },
                { label: 'Failed reservation', icon: 'pi pi-fw pi-calendar', to: route('bookings.index', {status: 'failed'}), roles: [1, 2,3] },
                { label: 'Pending pay reservation', icon: 'pi pi-fw pi-calendar', to: route('bookings.index', {status: 'pending'}), roles: [1, 2,3] },
                { label: 'Cancelled reservation', icon: 'pi pi-fw pi-calendar', to: route('bookings.index', {status: 'Cancelled'}), roles: [1, 2,3] },
                { label: 'Upcoming stays', icon: 'pi pi-fw pi-calendar', to: route('bookings.index', {status: 'upcoming_stay'}), roles: [1, 2,3] },
                { label: 'Current stays', icon: 'pi pi-fw pi-calendar', to: route('bookings.index', {status: 'checked_in'}), roles: [1, 2,3] },
                { label: 'Checked out', icon: 'pi pi-fw pi-calendar', to: route('bookings.index', {status: 'checked_out'}), roles: [1, 2,3] }
            ]
        },
        {
            label: 'Ride hire Management',
            items: [
                { label: 'Rides', icon: 'pi pi-fw pi-car', to: route('main-cars.index'), roles: [1, 2] },
                { label: 'Ride Categories', icon: 'pi pi-fw pi-tags', to: route('car-categories.index'), roles: [1] },
                { label: 'Ride Bookings', icon: 'pi pi-fw pi-calendar', to: route('car-bookings.index'), roles: [1, 2, 3] },
                { label: 'Failed reservation', icon: 'pi pi-fw pi-calendar', to: route('car-bookings.index', {status: 'failed'}), roles: [1, 2,3] },
                { label: 'Pending pay reservation', icon: 'pi pi-fw pi-calendar', to: route('car-bookings.index', {status: 'pending'}), roles: [1, 2,3] },
                { label: 'Cancelled reservation', icon: 'pi pi-fw pi-calendar', to: route('car-bookings.index', {status: 'Cancelled'}), roles: [1, 2,3] },
                { label: 'Upcoming rides', icon: 'pi pi-fw pi-calendar', to: route('car-bookings.index', {status: 'upcoming_stay'}), roles: [1, 2,3] },
                { label: 'Current rides', icon: 'pi pi-fw pi-calendar', to: route('car-bookings.index', {status: 'checked_in'}), roles: [1, 2,3] },
                { label: 'Checked out', icon: 'pi pi-fw pi-calendar', to: route('car-bookings.index', {status: 'checked_out'}), roles: [1, 2,3] }
            ]
        },
        {
            label: 'Markup Management',
            items: [
                { label: 'My Markups', icon: 'pi pi-fw pi-tags', to: route('markup.index'), roles: [2] },
                { label: 'Browse Properties', icon: 'pi pi-fw pi-home', to: route('markup.browse.properties'), roles: [2] },
                { label: 'Browse Cars', icon: 'pi pi-fw pi-car', to: route('markup.browse.cars'), roles: [2] }
            ]
        },
        {
            label: 'Payments & Reviews',
            items: [
                { label: 'Payments', icon: 'pi pi-fw pi-credit-card', to: route('payments.index'), roles: [1] },
                { label: 'Ristay wallet', icon: 'pi pi-fw pi-credit-card', to: route('wallet'), roles: [2,3,4] }
            ]
        },
        {
            label: 'Settings',
            items: [
                { label: 'Company', icon: 'pi pi-fw pi-briefcase', to: route('companies.index'), roles: [1] }
            ]
        }
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
