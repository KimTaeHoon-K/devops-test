import { RouteRecordRaw } from 'vue-router';

import NetworkList from '@/views/network/network/NetworkList.vue';
import RouterList from '@/views/network/router/RouterList.vue';
import FloatingIpList from '@/views/network/floating-ip/FloatingIpList.vue';
import SecurityGroupList from '@/views/network/security-group/SecurityGroupList.vue';
import NetworkCreate from '@/views/network/network/NetworkCreate.vue';
import SubnetCreate from '@/views/network/network/detail-components/subnet/SubnetCreate.vue';
import NetworkDetail from '@/views/network/network/NetworkDetail.vue';
import SubnetDetail from '@/views/network/network/detail-components/subnet/SubnetDetail.vue';
import RouterCreate from '@/views/network/router/RouterCreate.vue';
import PortList from '@/views/network/port/PortList.vue';
import PortCreate from '@/views/network/port/PortCreate.vue';
import RouterDetail from '@/views/network/router/RouterDetail.vue';
import SecurityGroupDetail from '@/views/network/security-group/SecurityGroupDetail.vue';
import SecurityGroupRuleCreate from '@/views/network/security-group/detail-components/security-group-rule/SecurityGroupRuleCreate.vue';
import IpRangeAdd from '@/views/network/router/IpRangeAdd.vue';
import FloatingIpCreate from '@/views/network/floating-ip/FloatingIpCreate.vue';
import ResourceAssociate from '@/views/network/floating-ip/ResourceAssociate.vue';
import SubnetUpdate from '@/views/network/network/detail-components/subnet/SubnetUpdate.vue';
import LoadBalancerList from '@/views/network/load-balancer/LoadBalancerList.vue';
import LoadBalancerCreate from '@/views/network/load-balancer/LoadBalancerCreate.vue';
import LoadBalancerDetail from '@/views/network/load-balancer/LoadBalancerDetail.vue';
import ListenerCreate from '@/views/network/load-balancer/detail-components/listener/ListenerCreate.vue';
import PoolCreate from '@/views/network/load-balancer/detail-components/pool/PoolCreate.vue';
import ListenerUpdate from '@/views/network/load-balancer/detail-components/listener/ListenerUpdate.vue';
import Topology from '@/views/network/topology/Topology.vue';

export const NetworkRouter: Array<RouteRecordRaw> = [
  {
    // Network
    path: '/network',
    name: 'contrabass network',
    meta: {
      title: 'menu.network.main',
    },
    children: [
      {
        // Topology
        path: '/network/topology',
        name: 'topology',
        component: Topology,
        meta: {
          title: 'menu.network.topology.main',
        },
      },
      {
        // Network
        path: '/network/network',
        name: 'network list',
        component: NetworkList,
        meta: {
          title: 'menu.network.network.main',
        },
      },
      {
        // Network
        path: '/network/network/create',
        name: 'network create',
        component: NetworkCreate,
        meta: {
          title: 'menu.network.network.create',
        },
      },
      {
        // Network
        path: '/network/network/:id',
        name: 'network detail',
        component: NetworkDetail,
        meta: {
          title: 'menu.network.network.detail',
        },
      },
      {
        // Network Subnet
        path: '/network/network/:id/subnet/create',
        name: 'network subnet create',
        component: SubnetCreate,
        meta: {
          title: 'menu.network.network.subnet.create',
        },
      },
      {
        // Network Subnet
        path: '/network/network/:id/subnet/:subnetId',
        name: 'network subnet detail',
        component: SubnetDetail,
        meta: {
          title: 'menu.network.network.subnet.detail',
        },
      },
      {
        // Network Subnet
        path: '/network/network/:id/subnet/:subnetId/update',
        name: 'network subnet update',
        component: SubnetUpdate,
        meta: {
          title: 'menu.network.network.subnet.update',
        },
      },
      {
        // Port
        path: '/network/port',
        name: 'port',
        component: PortList,
        meta: {
          title: 'menu.network.port.main',
        },
      },
      {
        // Port
        path: '/network/port/create',
        name: 'port create',
        component: PortCreate,
        meta: {
          title: 'menu.network.port.create',
        },
      },
      {
        // Router
        path: '/network/router',
        name: 'router',
        component: RouterList,
        meta: {
          title: 'menu.network.router.main',
        },
      },
      {
        // Router
        path: '/network/router/create',
        name: 'router create',
        component: RouterCreate,
        meta: {
          title: 'menu.network.router.create',
        },
      },
      {
        // Router
        path: '/network/router/:id',
        name: 'router detail',
        component: RouterDetail,
        meta: {
          title: 'menu.network.router.detail',
        },
      },
      {
        // Router
        path: '/network/router/:id/ip-range-add',
        name: 'router ip range add',
        component: IpRangeAdd,
        meta: {
          title: 'menu.network.router.ip-range-add',
        },
      },
      {
        // Floating Ip
        path: '/network/floating-ip',
        name: 'floating-ip',
        component: FloatingIpList,
        meta: {
          title: 'menu.network.floating-ip.main',
        },
      },
      {
        // Floating Ip
        path: '/network/floating-ip/create',
        name: 'floating-ip create',
        component: FloatingIpCreate,
        meta: {
          title: 'menu.network.floating-ip.create',
        },
      },
      {
        // Floating Ip
        path: '/network/floating-ip/:id/associate',
        name: 'floating-ip associate',
        component: ResourceAssociate,
        meta: {
          title: 'menu.network.floating-ip.resource-associate',
        },
      },
      {
        // Load Balancer
        path: '/network/load-balancer',
        name: 'load-balancer',
        component: LoadBalancerList,
        meta: {
          title: 'menu.network.load-balancer.main',
        },
      },
      {
        // Load Balancer
        path: '/network/load-balancer/create',
        name: 'load-balancer create',
        component: LoadBalancerCreate,
        meta: {
          title: 'menu.network.load-balancer.create',
        },
      },
      {
        // Load Balancer
        path: '/network/load-balancer/:id',
        name: 'load-balancer detail',
        component: LoadBalancerDetail,
        meta: {
          title: 'menu.network.load-balancer.detail',
        },
      },
      {
        // Load Balancer Listener
        path: '/network/load-balancer/:id/listener/create',
        name: 'load-balancer listener create',
        component: ListenerCreate,
        meta: {
          title: 'menu.network.load-balancer.listener.create',
        },
      },
      {
        // Load Balancer Listener
        path: '/network/load-balancer/:id/listener/:listenerId/update',
        name: 'load-balancer listener update',
        component: ListenerUpdate,
        meta: {
          title: 'menu.network..load-balancer.listener.update',
        },
      },
      {
        // Load Balancer Pool
        path: '/network/load-balancer/:id/pool/create',
        name: 'load-balancer pool create',
        component: PoolCreate,
        meta: {
          title: 'menu.network.load-balancer.pool.create',
        },
      },
      {
        // Security Group
        path: '/network/security-group',
        name: 'security group',
        component: SecurityGroupList,
        meta: {
          title: 'menu.network.security-group.main',
        },
      },
      {
        // Security Group
        path: '/network/security-group/:id',
        name: 'security group detail',
        component: SecurityGroupDetail,
        meta: {
          title: 'menu.network.security-group.detail',
        },
      },
      {
        // Security Group
        path: '/network/security-group/:id/rule-create',
        name: 'security group rule create',
        component: SecurityGroupRuleCreate,
        meta: {
          title: 'menu.network.security-group.rule-create',
        },
      },
    ],
  },
];
