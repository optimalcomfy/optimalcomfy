<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'=>$this->id,
            'amount'=>$this->amount,
            'status' => $this->status,
            'disbursed_at' => $this->disbursed_at,
            'employee_id' => $this->employee_id,
            'provider_id' => $this->provider_id,
            'employee'=>$this->employee,
            'provider'=>$this->provider
        ];
    }
}
